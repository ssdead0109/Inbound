package com.kcp.smartrack;

import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
    private long lastBackTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // WebView 카메라 및 미디어 접근 권한 명시적 허용 (HTTPS 원격 서버 WebRTC 카메라 연동)
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
            webView.setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(() -> {
                        request.grant(request.getResources());
                    });
                }
            });
        }

        // Intercept Android hardware back button and swipe gesture
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                long currentTime = System.currentTimeMillis();

                // 1. 어느 화면에서든 빠르게 2번(1500ms 이내) 누르면 즉시 앱 완전 종료!
                if (currentTime - lastBackTime < 1500) {
                    setEnabled(false);
                    finishAffinity();
                    return;
                }

                // 첫 번째 클릭 시간 기록
                lastBackTime = currentTime;

                // 2. 웹뷰에 전달하여 이전 화면 이동 or 모달 닫기
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().evaluateJavascript(
                        "(function() { return (typeof window.handleNativeBackButton === 'function') ? window.handleNativeBackButton() : false; })()",
                        new ValueCallback<String>() {
                            @Override
                            public void onReceiveValue(String value) {
                                boolean isHandled = "true".equals(value) || "\"true\"".equals(value);
                                if (!isHandled) {
                                    // 더 이상 뒤로 갈 수 없는 메인화면: 프로그램 종료 안내 메시지 출력
                                    Toast.makeText(MainActivity.this, "뒤로가기 버튼을 한 번 더 누르면 앱이 종료됩니다.", Toast.LENGTH_SHORT).show();
                                }
                            }
                        }
                    );
                } else {
                    setEnabled(false);
                    finishAffinity();
                }
            }
        });
    }
}
