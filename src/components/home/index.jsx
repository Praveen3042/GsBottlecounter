import React from 'react'
import { useAuth } from '../../contexts/authContext'
import { Iot } from './Iot.jsx'

const Home = () => {
    const { currentUser } = useAuth()
    return (
        // <div className='text-2xl font-bold pt-14'>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.</div>
        <div>
            {/* <div className='text-2xl font-bold pt-14'>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.</div> */}
            <Iot/>
        </div>
    )
}

export default Home