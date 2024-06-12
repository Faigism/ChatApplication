import { Link, useNavigate } from 'react-router-dom'
import style from './style.module.css'
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../../firebase'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Disabled from '../ButtonDisabled/Disabled'
import { getDatabase, ref, set } from 'firebase/database'

const Signup = () => {
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
    watch,
  } = useForm()

  const singUpGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      const db = getDatabase()
      await set(ref(db, 'users/' + user.uid), {
        displayName: user.displayName,
        email: user.email,
      })
      toast.success('Sign Up Successful', {
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        className: 'text-[15px]',
      })
      navigate('/')
    } catch (error) {
      toast.error('Sign Up Failed', {
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        className: 'text-[15px]',
      })
    }
  }

  const createAccount = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      )
      const user = userCredential.user

      const db = getDatabase()
      await set(ref(db, 'users/' + user.uid), {
        displayName: data.displayName,
        email: data.email,
      })
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
      navigate('/')
    } catch (error) {
      toast.error('Registration failed, please try again')
    }
  }

  const password = watch('password')

  return (
    <section className="input_sec">
      <div className="input">
        <h1>Create an Account</h1>
        <span>
          Already a member?{' '}
          <Link to={'/'} className={style.loginLink}>
            Login
          </Link>
        </span>
        <form onSubmit={handleSubmit(createAccount)}>
          <input
            type="text"
            placeholder="Full Name"
            {...register('displayName', { required: 'Full Name is required' })}
          />
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
          <div>
            <input
              placeholder="Confirm Password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
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
          {errors.displayName && (
            <p className={style.error}>{errors.displayName.message}</p>
          )}
          {errors.email && (
            <p className={style.error}>{errors.email.message}</p>
          )}
          {errors.password && (
            <p className={style.error}>{errors.password.message}</p>
          )}
          {errors.confirmPassword && (
            <p className={style.error}>{errors.confirmPassword.message}</p>
          )}
          <button className={style.button}>
            {isSubmitting ? <Disabled /> : 'Sign Up'}
          </button>
        </form>
        <div className="btn-google">
          <button type="submit" onClick={singUpGoogle} className={style.button}>
            <i className="fa-brands fa-google"></i>
            {isSubmitting ? <Disabled /> : 'Sign In with Google'}
          </button>
        </div>
      </div>
    </section>
  )
}
export default Signup
