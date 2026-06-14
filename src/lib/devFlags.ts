import { Platform } from 'react-native';

/**
 * 임시(웹 미리보기용) 플래그.
 * 웹은 헤드리스/프리뷰 브라우저가 카메라 권한을 거부해 온보딩이 막히므로,
 * 웹에서만 카메라 권한 게이트를 건너뛴다.
 * 실기기(ios/android)에는 영향 없음 — 정상적으로 권한을 요청한다.
 */
export const SKIP_CAMERA_GATE = Platform.OS === 'web';
