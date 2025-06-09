import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { doSignOut } from '../../firebase/auth'

const Header = () => {
    const navigate = useNavigate()
    const { userLoggedIn } = useAuth()

    // Avoid rendering nav until login state is determined
    if (userLoggedIn === null) {
        return null
    }

    return (
        <nav className='flex flex-row gap-x-2 w-full z-20 fixed top-0 left-0 h-12 border-b place-content-center items-center bg-gray-200'>
            {
                userLoggedIn ? (
                    <>
                        {/* Navigation links visible only after login */}
                        <Link className='text-sm text-blue-600 underline' to='/dashboard'>Dashboard</Link>
                        <Link className='text-sm text-blue-600 underline' to='/profile'>Profile</Link>
                        <Link className='text-sm text-blue-600 underline' to='/settings'>Settings</Link>

                        {/* Logout Button */}
                        <button
                            onClick={() => {
                                doSignOut().then(() => navigate('/login'))
                            }}
                            className='ml-auto text-sm text-red-600 underline'
                        >
                            Logout
                        </button>
                    </>
                )  : (
                    <>
                        <Link className='text-sm text-blue-600 underline' to='/login'>Login</Link>
                        {/* <Link className='text-sm text-blue-600 underline' to='/register'>Register New Account</Link> */}
                    </>
                )
            }
        </nav>
    )
}

export default Header