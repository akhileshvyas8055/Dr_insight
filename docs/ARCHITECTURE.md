# D₹ Insights architecture

## Data layers
1. Raw uploaded CSV files in `data/raw/`
2. Processed analytics tables in `database/processed/`
3. PostgreSQL serving normalized + precomputed tables
4. FastAPI service layer exposing read-optimized endpoints
5. React dashboard consuming cached APIs

## Key production choices
- Precompute heavy analytics before API serving
- Keep benchmark/fair-price logic server-side
- Separate raw, processed, and app-serving tables
- Use pagination for price comparison
- Use lightweight geospatial approximation for nearest hospital by pincode until a full India pincode geocoder is added
- Keep AI modules deterministic by default so demos are reliable without paid APIs
