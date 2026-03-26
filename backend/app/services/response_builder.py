"""
Response Builder — converts comparison data into natural spoken sentences.
Formats prices in Indian number style (lakhs).
"""


def _format_indian(n: float | int) -> str:
    """Format a number in Indian style: 3,10,000 instead of 310,000."""
    n = int(round(n))
    s = str(n)
    if len(s) <= 3:
        return s

    # last 3 digits
    result = s[-3:]
    s = s[:-3]

    # group remaining digits in pairs
    while s:
        result = s[-2:] + "," + result
        s = s[:-2]

    return result


def build_comparison_response(
    cheapest_hospital: str,
    cheapest_price: float,
    expensive_hospital: str,
    expensive_price: float,
    price_difference: float,
    city: str,
    procedure: str,
) -> str:
    """Build a natural spoken English sentence from comparison data."""
    return (
        f"Here are the results for {procedure} in {city}. "
        f"The lowest price is offered by {cheapest_hospital} at {_format_indian(cheapest_price)} rupees. "
        f"The highest price is at {expensive_hospital} at {_format_indian(expensive_price)} rupees. "
        f"The price difference is {_format_indian(price_difference)} rupees. "
        f"You can save {_format_indian(price_difference)} rupees by choosing {cheapest_hospital}."
    )


def build_fair_price_response(
    procedure: str,
    city: str,
    user_quote: float,
    median_price: float,
    min_price: float,
    max_price: float,
    benchmark_rate: float,
    verdict: str,
) -> str:
    """Build a natural spoken English sentence from fair-price check data."""
    return (
        f"Here is the fair price check for {procedure} in {city}. "
        f"Your quoted price of {_format_indian(user_quote)} rupees is considered {verdict}. "
        f"The average price in {city} is {_format_indian(median_price)} rupees. "
        f"Prices range from {_format_indian(min_price)} to {_format_indian(max_price)} rupees. "
        f"The benchmark rate is {_format_indian(benchmark_rate)} rupees."
    )
