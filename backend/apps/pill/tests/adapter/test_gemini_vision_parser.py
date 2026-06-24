"""Gemini Vision 응답 파서(parse_attributes) 단위 테스트 — SDK 불필요(순수 함수)."""

from __future__ import annotations

from apps.pill.adapter.outbound.gemini_vision_adapter import parse_attributes
from apps.pill.domain.value_objects.pill_attributes import Color, ScoreLine, Shape


def test_parses_valid_json() -> None:
    raw = (
        '{"shape":"원형","color_front":"하양","color_back":null,'
        '"imprint_front":"T","imprint_back":null,"score_line":"-","form":"정제"}'
    )
    attrs = parse_attributes(raw)
    assert attrs.shape is Shape.ROUND
    assert attrs.color_front is Color.WHITE
    assert attrs.color_back is None
    assert attrs.imprint_front == "T"
    assert attrs.score_line is ScoreLine.LINE


def test_unknown_enum_value_becomes_none() -> None:
    attrs = parse_attributes('{"shape":"별모양","color_front":"형광초록"}')
    assert attrs.shape is None
    assert attrs.color_front is None


def test_malformed_json_returns_empty_attributes() -> None:
    attrs = parse_attributes("이건 JSON 이 아님")
    assert attrs.shape is None
    assert attrs.imprint_front is None


def test_blank_imprint_normalised_to_none() -> None:
    attrs = parse_attributes('{"imprint_front":"   "}')
    assert attrs.imprint_front is None
