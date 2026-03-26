from typing import List, Optional
from sqlalchemy.orm import Session
from app.services.query_service import QueryService
from app.schemas.smart_savings import *
from app.services.sarvam_service import text_to_speech, translate_text

class SmartSavingsService:

    def _get_user_city_prices(self, db: Session, city_name: str, procedure_name: str) -> Optional[dict]:
        qs = QueryService(db)
        sql = """
            SELECT p.hospital_name, h.rating, p.package_price_demo as price,
                   p.city as city_name, c.latitude, c.longitude
            FROM hospital_prices p
            LEFT JOIN hospitals h ON p.hospital_id = h.hospital_id
            LEFT JOIN cities c ON LOWER(p.city) = LOWER(c.city)
            WHERE LOWER(p.city) = LOWER(:city)
              AND LOWER(p.procedure_name) = LOWER(:procedure)
            ORDER BY p.package_price_demo ASC
        """
        results = qs.fetch_all(sql, {"city": city_name, "procedure": procedure_name})
        if not results:
            return None

        hospitals = [
            {"hospital_name": r["hospital_name"], "price": float(r["price"]), "rating": float(r["rating"]) if r.get("rating") else None}
            for r in results
        ]

        return {
            "city": results[0]["city_name"],
            "city_lat": results[0].get("latitude"),
            "city_lng": results[0].get("longitude"),
            "cheapest": hospitals[0],
            "most_expensive": hospitals[-1],
            "all_hospitals": hospitals,
        }

    def _get_nearby_cities(self, db: Session, city_name: str, max_distance_km: int, max_count: int) -> List[dict]:
        qs = QueryService(db)
        sql = """
            SELECT d.to_city as city_name, c.latitude, c.longitude, d.distance_km, d.travel_time_hours,
                   d.bus_cost, d.train_cost, d.flight_cost, d.avg_hotel_per_night
            FROM city_distances d
            LEFT JOIN cities c ON LOWER(d.to_city) = LOWER(c.city)
            WHERE LOWER(d.from_city) = LOWER(:city)
              AND d.distance_km <= :max_distance
            ORDER BY d.distance_km ASC
            LIMIT :max_count
        """
        results = qs.fetch_all(sql, {"city": city_name, "max_distance": max_distance_km, "max_count": max_count})
        
        return [
            {
                "city_id": r["city_name"],
                "city_name": r["city_name"],
                "city_lat": r.get("latitude"),
                "city_lng": r.get("longitude"),
                "distance_km": r["distance_km"],
                "travel_time_hours": r["travel_time_hours"],
                "bus_cost": r.get("bus_cost"),
                "train_cost": r.get("train_cost"),
                "flight_cost": r.get("flight_cost"),
                "avg_hotel_per_night": r.get("avg_hotel_per_night") or 1000,
            }
            for r in results
        ]

    def _get_cheapest_in_city(self, db: Session, city_name: str, procedure_name: str) -> Optional[dict]:
        qs = QueryService(db)
        sql = """
            SELECT p.hospital_name, h.rating, p.package_price_demo as price
            FROM hospital_prices p
            LEFT JOIN hospitals h ON p.hospital_id = h.hospital_id
            WHERE LOWER(p.city) = LOWER(:city)
              AND LOWER(p.procedure_name) = LOWER(:procedure)
            ORDER BY p.package_price_demo ASC
            LIMIT 1
        """
        row = qs.fetch_one(sql, {"city": city_name, "procedure": procedure_name})
        if not row:
            return None

        return {
            "hospital_name": row["hospital_name"],
            "rating": float(row["rating"]) if row.get("rating") else None,
            "price": float(row["price"]),
        }

    def _calculate_travel_cost(
        self, nearby: dict, travel_mode: str, stay_days: int, companions: int
    ) -> TravelCostBreakdown:
        people = 1 + companions

        mode_costs = {
            "bus": nearby.get("bus_cost"),
            "train": nearby.get("train_cost"),
            "flight": nearby.get("flight_cost"),
        }

        selected_cost = mode_costs.get(travel_mode)
        actual_mode = travel_mode

        # Fallback
        if selected_cost is None:
            for fallback in ["train", "bus", "flight"]:
                if mode_costs.get(fallback) is not None:
                    selected_cost = mode_costs[fallback]
                    actual_mode = fallback
                    break
            if selected_cost is None:
                selected_cost = 0

        round_trip = selected_cost * 2 * people
        hotel_per_night = nearby["avg_hotel_per_night"]
        hotel_total = hotel_per_night * stay_days

        all_modes = {}
        for mode, cost in mode_costs.items():
            if cost is not None:
                rt = cost * 2 * people
                all_modes[mode] = {
                    "one_way_per_person": cost,
                    "round_trip_total": rt,
                    "total_with_hotel": rt + hotel_total,
                }

        return TravelCostBreakdown(
            travel_mode=actual_mode,
            one_way_per_person=selected_cost,
            round_trip_total=round_trip,
            hotel_per_night=hotel_per_night,
            hotel_total=hotel_total,
            total_travel_cost=round_trip + hotel_total,
            all_modes=all_modes,
        )

    def _build_voice_text(self, user_city: dict, savings: List[NearbyCitySaving], procedure: str) -> str:
        baseline = user_city["cheapest"]["price"]
        city = user_city["city"]

        if not savings:
            return (
                f"Your city {city} already offers the best value for {procedure}. "
                f"The cheapest option is {user_city['cheapest']['hospital_name']} "
                f"at {self._price_to_words(baseline)} rupees. "
                f"Nearby cities don't offer enough savings to justify travel costs."
            )

        best = savings[0]
        text = (
            f"Great news! I found savings options for {procedure} near {city}. "
            f"The best option is {best.city}, where {best.hospital_name} "
            f"offers the procedure at {self._price_to_words(best.procedure_price)} rupees. "
            f"Including round trip travel cost of {self._price_to_words(best.travel_cost_breakdown.round_trip_total)} rupees "
            f"and {int(best.travel_cost_breakdown.hotel_total / best.travel_cost_breakdown.hotel_per_night)} nights "
            f"hotel stay of {self._price_to_words(best.travel_cost_breakdown.hotel_total)} rupees, "
            f"your total cost would be {self._price_to_words(best.total_cost)} rupees. "
            f"Compared to {city}'s cheapest price of {self._price_to_words(baseline)} rupees, "
            f"you save {self._price_to_words(best.net_savings)} rupees. "
            f"That is {best.savings_percentage:.0f} percent savings!"
        )

        return text

    def _build_map_data(self, user_city: dict, savings: List[NearbyCitySaving]) -> dict:
        markers = [
            {
                "type": "user_city",
                "name": user_city["city"],
                "lat": user_city.get("city_lat"),
                "lng": user_city.get("city_lng"),
                "hospital": user_city["cheapest"]["hospital_name"],
                "price": user_city["cheapest"]["price"],
                "color": "red",
            }
        ]

        for s in savings:
            markers.append({
                "type": "savings_city",
                "name": s.city,
                "lat": s.city_lat,
                "lng": s.city_lng,
                "hospital": s.hospital_name,
                "price": s.procedure_price,
                "total_cost": s.total_cost,
                "savings": s.net_savings,
                "savings_pct": s.savings_percentage,
                "rank": s.rank,
                "color": "green",
            })

        return {
            "center": {
                "lat": user_city.get("city_lat") or 20.5937,
                "lng": user_city.get("city_lng") or 78.9629,
            },
            "zoom": 6,
            "markers": markers,
        }

    def _price_to_words(self, amount: float) -> str:
        if amount >= 100000:
            return f"{amount / 100000:.2f} lakh"
        elif amount >= 1000:
            return f"{amount:,.0f}"
        return str(int(amount))

    async def get_smart_savings(self, db: Session, request: SmartSavingsRequest) -> SmartSavingsResponse:
        user_data = self._get_user_city_prices(db, request.city, request.procedure)
        if not user_data:
            return SmartSavingsResponse(
                success=False,
                user_city=UserCityResult(
                    city=request.city, cheapest_hospital="N/A", cheapest_price=0,
                    most_expensive_hospital="N/A", most_expensive_price=0, all_hospitals=[],
                ),
                nearby_city_savings=[], no_savings_cities=[],
                text_response={"english": f"No data found for {request.procedure} in {request.city}.", "localized": ""},
                map_data={"center": {"lat": 20.5937, "lng": 78.9629}, "zoom": 5, "markers": []},
            )

        baseline_price = user_data["cheapest"]["price"]

        nearby = self._get_nearby_cities(db, request.city, request.max_distance_km, request.max_nearby_cities + 5)

        savings_list: List[NearbyCitySaving] = []
        no_savings_list: List[NoSavingsCity] = []

        for nc in nearby:
            cheapest = self._get_cheapest_in_city(db, nc["city_id"], request.procedure)
            if not cheapest:
                continue

            travel = self._calculate_travel_cost(nc, request.travel_mode, request.stay_days, request.companions)
            total_cost = cheapest["price"] + travel.total_travel_cost
            net_savings = baseline_price - total_cost
            savings_pct = (net_savings / baseline_price) * 100 if baseline_price > 0 else 0

            hrs = nc["travel_time_hours"]
            time_display = f"{int(hrs)}h {int((hrs % 1) * 60)}m" if hrs % 1 else f"{int(hrs)} hrs"

            if net_savings > 0:
                savings_list.append(NearbyCitySaving(
                    rank=0, city=nc["city_name"],
                    city_lat=nc.get("city_lat"), city_lng=nc.get("city_lng"),
                    distance_km=nc["distance_km"],
                    travel_time_hours=nc["travel_time_hours"],
                    travel_time_display=time_display,
                    hospital_name=cheapest["hospital_name"],
                    hospital_rating=cheapest.get("rating"),
                    procedure_price=cheapest["price"],
                    travel_cost_breakdown=travel,
                    total_cost=total_cost,
                    net_savings=net_savings,
                    savings_percentage=round(savings_pct, 1),
                    is_worth_it=savings_pct > 5,
                ))
            else:
                no_savings_list.append(NoSavingsCity(
                    city=nc["city_name"], distance_km=nc["distance_km"],
                    cheapest_price=cheapest["price"], total_cost=total_cost,
                    reason=f"Total ₹{total_cost:,.0f} with travel vs ₹{baseline_price:,.0f} in {request.city}",
                ))

        sorters = {
            SortBy.highest_savings: lambda x: -x.net_savings,
            SortBy.nearest_first: lambda x: x.distance_km,
            SortBy.lowest_total: lambda x: x.total_cost,
            SortBy.shortest_travel: lambda x: x.travel_time_hours,
        }
        savings_list.sort(key=sorters.get(request.sort_by, lambda x: -x.net_savings))

        for i, s in enumerate(savings_list):
            s.rank = i + 1
        savings_list = savings_list[:request.max_nearby_cities]

        best_rec = None
        if savings_list:
            b = savings_list[0]
            best_rec = BestRecommendation(
                city=b.city, hospital=b.hospital_name,
                total_cost=b.total_cost, savings=b.net_savings,
                savings_percentage=b.savings_percentage,
                message=f"Travel to {b.city} and save ₹{b.net_savings:,.0f} ({b.savings_percentage:.0f}% savings)!",
            )

        user_city_result = UserCityResult(
            city=user_data["city"],
            city_lat=user_data.get("city_lat"),
            city_lng=user_data.get("city_lng"),
            cheapest_hospital=user_data["cheapest"]["hospital_name"],
            cheapest_price=user_data["cheapest"]["price"],
            most_expensive_hospital=user_data["most_expensive"]["hospital_name"],
            most_expensive_price=user_data["most_expensive"]["price"],
            all_hospitals=user_data["all_hospitals"],
        )

        english_text = self._build_voice_text(user_data, savings_list, request.procedure)
        localized_text = english_text

        if request.language != "en-IN":
            try:
                translated = await translate_text(english_text, "en-IN", request.language)
                if translated:
                    localized_text = translated
            except Exception as e:
                print(f"Translation error (non-fatal): {e}")

        voice_response = None
        try:
            tts_base64 = await text_to_speech(localized_text, request.language, request.speaker)
            if tts_base64:
                voice_response = {
                    "audio_base64": tts_base64,
                    "format": "wav",
                    "language": request.language,
                    "sample_rate": 22050,
                }
        except Exception as e:
            print(f"TTS error (non-fatal): {e}")

        map_data = self._build_map_data(user_data, savings_list)

        return SmartSavingsResponse(
            success=True,
            user_city=user_city_result,
            nearby_city_savings=savings_list,
            no_savings_cities=no_savings_list,
            best_recommendation=best_rec,
            text_response={"english": english_text, "localized": localized_text},
            voice_response=voice_response,
            map_data=map_data,
        )

smart_savings_service = SmartSavingsService()
