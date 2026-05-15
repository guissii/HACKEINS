from app.services.decision_engine import decide
from app.services.data_source import list_farms


def _farm(idx: int):
    return list_farms()[idx]


def test_dry_citrus_no_rain_irrigates():
    d = decide(_farm(0))
    assert d.action == "IRRIGATE"
    assert d.irrigation_minutes > 0
    assert d.irrigation_liters > 0


def test_moist_wheat_with_rain_skips():
    d = decide(_farm(1))
    # soil 42% > threshold 28% → SKIP regardless of rain
    assert d.action == "SKIP"
    assert d.irrigation_minutes == 0


def test_dry_olive_triggers_frost_alert():
    d = decide(_farm(2))
    assert d.action == "IRRIGATE"
    types = {a.type for a in d.alerts}
    assert "frost" in types  # temp_min 6°C < 8°C threshold


def test_et0_positive():
    for i in range(3):
        d = decide(_farm(i))
        assert d.et0_mm > 0
