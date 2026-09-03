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
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().evaluateJavascript(
                        "(function() { return (typeof window.handleNativeBackButton === 'function') ? window.handleNativeBackButton() : false; })()",
                        new ValueCallback<String>() {
                            @Override
                            public void onReceiveValue(String value) {
                                boolean isHandled = "true".equals(value) || "\"true\"".equals(value);
                                if (isHandled) {
                                    // Successfully handled by Web application (modal closed, returned to previous screen)
                                    return;
                                }

                                // At root screen: require two presses within 2000ms to exit app
                                long currentTime = System.currentTimeMillis();
                                if (currentTime - lastBackTime < 2000) {
                                    setEnabled(false);
                                    MainActivity.super.onBackPressed();
                                } else {
                                    lastBackTime = currentTime;
                                    Toast.makeText(MainActivity.this, "뒤로가기 버튼을 한 번 더 누르면 종료됩니다.", Toast.LENGTH_SHORT).show();
                                }
                            }
                        }
                    );
                } else {
                    setEnabled(false);
                    MainActivity.super.onBackPressed();
                }
            }
        });
    }
}
