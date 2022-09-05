package com.kyonggi.hearing.presentation.login

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.kakao.sdk.auth.model.OAuthToken
import com.kakao.sdk.common.model.ClientError
import com.kakao.sdk.common.model.ClientErrorCause
import com.kakao.sdk.user.UserApiClient
import com.kyonggi.hearing.AppViewModel
import com.kyonggi.hearing.R
import com.kyonggi.hearing.data.model.UserInfo
import com.kyonggi.hearing.databinding.BottomLoginLayoutBinding
import com.kyonggi.hearing.presentation.main.MainActivity
import timber.log.Timber

class SignInBottomSheetFragment: BottomSheetDialogFragment() {
    private lateinit var binding: BottomLoginLayoutBinding
    private lateinit var viewModel: AppViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = BottomLoginLayoutBinding.inflate(layoutInflater)
        viewModel = (activity as MainActivity).viewModel
        return binding.root
    }

    override fun getTheme(): Int {
        return R.style.CustomBottomSheetDialog
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.kakaoLoginButton.setOnClickListener{
            loginWithKakao()
            dismiss()
        }
    }

    private fun loginWithKakao() {
        // 카카오계정으로 로그인 공통 callback 구성
        // 카카오톡으로 로그인 할 수 없어 카카오계정으로 로그인할 경우 사용됨
        val callback: (OAuthToken?, Throwable?) -> Unit = { token, error ->
            if (error != null) {
                Timber.e("카카오계정으로 로그인 실패", error)
            } else if (token != null) {
                Timber.i("카카오계정으로 로그인 성공 ${token.accessToken}")
                // 사용자 정보 저장
                getUserInfo(token.toString())
            }
        }

        // 카카오톡이 설치되어 있으면 카카오톡으로 로그인, 아니면 카카오계정으로 로그인
        if (UserApiClient.instance.isKakaoTalkLoginAvailable(requireContext())) {
            UserApiClient.instance.loginWithKakaoTalk(requireContext()) { token, error ->
                if (error != null) {
                    Timber.e("카카오톡으로 로그인 실패", error)

                    // 사용자가 카카오톡 설치 후 디바이스 권한 요청 화면에서 로그인을 취소한 경우,
                    // 의도적인 로그인 취소로 보고 카카오계정으로 로그인 시도 없이 로그인 취소로 처리 (예: 뒤로 가기)
                    if (error is ClientError && error.reason == ClientErrorCause.Cancelled) {
                        return@loginWithKakaoTalk
                    }

                    // 카카오톡에 연결된 카카오계정이 없는 경우, 카카오계정으로 로그인 시도
                    UserApiClient.instance.loginWithKakaoAccount(requireContext(), callback = callback)
                } else if (token != null) {
                    // 사용자 정보 저장
                    getUserInfo(token.toString())
                    Timber.i("카카오톡으로 로그인 성공 ${token.accessToken}")
                }
            }
        } else {
            UserApiClient.instance.loginWithKakaoAccount(requireContext(), callback = callback)
            // 사용자 정보 저장
        }
    }


    private fun getUserInfo(token: String) {
        UserApiClient.instance.me { user, error ->
            if (error != null) {
                Timber.e("사용자 정보 요청 실패", error)
            }
            else if (user != null) {
                Timber.i("사용자 정보 요청 성공" +
                        "\n회원번호: ${user.id}" +
                        "\n닉네임: ${user.kakaoAccount?.profile?.nickname}" +
                        "\n프로필사진: ${user.kakaoAccount?.profile?.thumbnailImageUrl}")
                viewModel.saveUserInfo(
                    UserInfo(
                        token = token,
                        nickName = user.kakaoAccount?.profile?.nickname!!,
                        profileImage = user.kakaoAccount?.profile?.thumbnailImageUrl!!
                    )
                )
            }
        }
    }
}