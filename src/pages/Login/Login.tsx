import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { Button, Divider, Spin, message } from 'antd'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import authApi from 'src/apis/auth.api'
import Input from 'src/components/Input'
import { AppContext } from 'src/contexts/app.context'
import { ResponseUnprocessableEntityApi } from 'src/types/utils.type'
import { schema, Schema } from 'src/utils/rules'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { LoadingOutlined } from '@ant-design/icons'
import { toast } from 'react-toastify'
import http from 'src/utils/http'
import { VerificationCode } from 'src/constants/auth.constant'
import * as yup from 'yup'

type FormData = {
  email: string
  password: string
  totpCode?: string
  code?: string
}
function getCodeKey(type: string): string {
  return type === 'otp' ? 'code' : 'totpCode'
}
export default function Login() {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const handleGoogleLogin = async (e: any) => {
    e.preventDefault()
    const response = await http.get(`/auth/google-link`)
    window.location.href = response.data.url
  }
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(
      schema
        .shape({ code: yup.string().optional(), totpCode: yup.string().optional() })
        .pick(['email', 'password', 'code', 'totpCode'])
    )
  })
  const [auth, setAuth] = useState({ enable: false, type: 'otp', code: '' })
  const [email, setEmail] = useState('')
  const loginMutation = useMutation({
    mutationFn: (body: FormData) => {
      if (auth.enable) {
        body = { ...body, [getCodeKey(auth.type)]: auth.code }
      }
      return authApi.login(body)
    }
  })
  const sendOtpMutation = useMutation({
    mutationFn: authApi.sendOTP,
    onSuccess: () => {
      message.success('Đã gửi mã OTP về email')
    },
    onError: () => {
      message.error('Gửi OTP thất bại. Vui lòng thử lại!')
    }
  })

  const handleSendOtp = () => {
    sendOtpMutation.mutate({ email, type: VerificationCode.LOGIN })
  }
  const onSubmit = handleSubmit((data) => {
    const body = data
    setEmail(body.email)
    loginMutation.mutate(body, {
      onSuccess: (data) => {
        setIsAuthenticated(true)
        setProfile(data.data.data.user)
        if (data.data.data.user.roleId === 2) {
          navigate('/')
        } else {
          navigate('/manage/profile')
        }
        toast.success(data.data.message)
      },
      onError: (error) => {
        if (isAxiosUnprocessableEntityError<ResponseUnprocessableEntityApi<FormData>>(error)) {
          const formError = error.response?.data.message
          if (formError) {
            if (formError.find((err) => err.message === 'Error.InvalidTOTPAndCode')) {
              setAuth({ ...auth, enable: true })
            }
            formError.forEach((err) => {
              setError(err.path, {
                message: err.message,
                type: 'Server'
              })
            })
          }
        }
      }
    })
  })
  return (
    <div className=' w-full bg-[url(https://down-vn.img.susercontent.com/file/sg-11134004-7rask-ma3xoou24b6q25)]'>
      <div className='container'>
        <div className='grid grid-cols-1 py-12 lg:grid-cols-5 lg:py-32 lg:pr-10'>
          <div className='lg:col-span-2 lg:col-start-4'>
            <form className='rounded bg-white p-10 shadow-sm' onSubmit={onSubmit} noValidate>
              <div className='text-2xl'>Đăng nhập</div>
              <Input
                name='email'
                register={register}
                type='email'
                className='mt-8'
                errorMessage={errors.email?.message}
                placeholder='Email'
              />
              <Input
                name='password'
                register={register}
                type='password'
                className='mt-2'
                errorMessage={errors.password?.message}
                placeholder='Password'
                autoComplete='on'
              />
              {auth.enable && (
                <>
                  <label className='mb-1 block text-sm font-medium'>Code Type</label>
                  <select
                    className='w-full rounded-xl border p-2'
                    value={auth.type}
                    onChange={(e) => {
                      setAuth({ ...auth, type: e.target.value })
                    }}
                  >
                    <option value='otp'>OTP</option>
                    <option value='2fa'>2FA</option>
                  </select>

                  <label className='mb-1 block text-sm font-medium'>
                    {auth.type === '2fa' ? '2FA Code' : 'OTP Code'}
                  </label>
                  <div className='flex'>
                    <input
                      type='text'
                      name={auth.type === '2fa' ? 'totpCode' : 'code'}
                      className='mr-4 w-1/2 rounded-xl border p-2'
                      value={auth.code}
                      onChange={(e) => setAuth({ ...auth, code: e.target.value })}
                      required
                    />

                    {auth.type === 'otp' && (
                      <Button onClick={handleSendOtp} disabled={sendOtpMutation.isLoading}>
                        {sendOtpMutation.isLoading && <Spin indicator={<LoadingOutlined spin />} />}
                        <span className='ml-2'>Gửi mã OTP</span>
                      </Button>
                    )}
                  </div>
                </>
              )}
              <div className='mt-2'>
                <button
                  type='submit'
                  className='flex w-full items-center justify-center bg-red-500 px-2 py-4 text-center text-sm uppercase text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={loginMutation.isLoading}
                >
                  {loginMutation.isLoading && <Spin indicator={<LoadingOutlined spin />} />}
                  <span className='ml-2'> Đăng nhập</span>
                </button>
              </div>
              <div className='mt-5 flex justify-start'>
                <Link to='/forgot-password' className=' text-red-400'>
                  Quên mật khẩu?
                </Link>
              </div>
              <Divider />
              <div className='mt-8 flex flex-col items-center justify-center gap-1'>
                <div className='mb-5 flex items-center gap-4'>
                  <div className='text-gray-300'>Bạn chưa có tài khoản?</div>
                  <Link to='/register' className=' text-red-400'>
                    Đăng ký tài khoản mới
                  </Link>
                </div>
                <button
                  onClick={handleGoogleLogin}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#fff',
                    color: '#000',
                    padding: '10px 20px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                    alt='Google icon'
                    style={{ width: '20px', height: '20px' }}
                  />
                  Đăng nhập với Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
