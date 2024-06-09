import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../../firebase'
import { toast } from 'react-toastify'
import style from './style.module.css'
import Disabled from '../ButtonDisabled/Disabled'
import { useState } from 'react'

const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const handleShowPassword = () => {
    setShowPassword(!showPassword)
  }
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm()

  const signInGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      console.log('User Info:', user)
      toast.success('Sign In Successful', {
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        className: 'text-[15px]',
      })
      navigate('/chat')
    } catch (error) {
      toast.error('Sign In Failed')
    }
  }

  const Login = async (data) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      toast.success('Sign Up Successful', {
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        className: 'text-[15px]',
      })
      reset()
      navigate('/chat')
    } catch (error) {
      reset()
      toast.error('Registration failed, please try again')
      setError('email', {
        type: 'manual',
        message: 'Invalid email or password',
      })
    }
  }
  return (
    <section className="input_sec">
      <div className="input">
        <h1>Welcome Back</h1>
        <span>
          New here?{' '}
          <Link to={'/signup'} className={style.signupLink}>
            Sign Up
          </Link>
        </span>
        <form onSubmit={handleSubmit(Login)}>
          <input
            type="email"
            placeholder="Email"
            {...register('email', { required: 'Email is required' })}
          />
          <div>
            <input
              placeholder="Password"
              {...register('password', { required: 'Password is required' })}
              type={showPassword ? 'text' : 'password'}
            />
            {showPassword ? (
              <i className="fa-solid fa-eye" onClick={handleShowPassword}></i>
            ) : (
              <i
                className="fa-solid fa-eye-slash"
                onClick={handleShowPassword}
              ></i>
            )}
          </div>
          {errors.email && (
            <p className={style.error}>{errors.email.message}</p>
          )}
          <button type="submit" className={style.button}>
            {isSubmitting ? <Disabled /> : 'Login'}
          </button>
        </form>
        <div>
          <button onClick={signInGoogle} className={style.button}>
            <i className="fa-brands fa-google"></i>
            {isSubmitting ? <Disabled /> : 'Sign In with Google'}
          </button>
        </div>
      </div>
    </section>
  )
}
export default Login
