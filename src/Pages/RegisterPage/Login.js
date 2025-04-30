import React, { useState } from 'react'
import { FiMail, FiLock } from "react-icons/fi"
import { motion } from "framer-motion"
import "../RegisterPage/RegisterPage.css"
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../services/auth'

const Login = () => {
    const [error, setError] = useState({})
    const [submit, setSubmit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (error[name]) {
            setError(prev => ({
                ...prev,
                [name]: ""
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await login(formData)
            if (response.token) {
                navigate("/home")
            }
        } catch (err) {
            setError({ submit: err.response?.data?.message || "An error occurred during login" })
        }
        setLoading(false)
    }

    const validationLogin = (data) => {
        const errors = {}
        const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/
        const passwordPattern = /^[a-zA-Z0-9!@#$%^&*_=+-]{8,12}$/g

        if (!data.email) {
            errors.email = "Email is required"
        } else if (!emailPattern.test(data.email)) {
            errors.email = "Please enter a valid email"
        }

        if (!data.password) {
            errors.password = "Password is required"
        } else if (!passwordPattern.test(data.password)) {
            errors.password = "Password must be 8-12 characters"
        }
        
        return errors
    }

    return (
        <motion.div 
            className="container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div 
                className="container-form"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <form onSubmit={handleSubmit}>
                    <h1>We're glad to see you back</h1>
                    <p>Please sign in to continue.</p>

                    {error.submit && (
                        <motion.span 
                            className="error-message"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {error.submit}
                        </motion.span>
                    )}

                    <div className="inputBox">
                        <FiMail />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                        {error.email && (
                            <motion.span 
                                className="error-message"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error.email}
                            </motion.span>
                        )}
                    </div>

                    <div className="inputBox">
                        <FiLock />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                        {error.password && (
                            <motion.span 
                                className="error-message"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error.password}
                            </motion.span>
                        )}
                    </div>

                    <div className="divBtn">
                        <span className="FG">Forgot Password?</span>
                        <motion.button 
                            type="submit"
                            className="loginBtn"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </motion.button>
                    </div>
                </form>

                <div className="dont">
                    <p>
                        Don't have an account?
                        <Link to="/signup">
                            <motion.span 
                                whileHover={{ color: "#8b5cf6" }}
                            >
                                Sign up
                            </motion.span>
                        </Link>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default Login