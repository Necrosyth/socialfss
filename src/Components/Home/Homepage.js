import React from 'react'
import Feedposts from './Feedposts'
import "../Home/Homepage.css"

const Homepage = ({posts, setPosts, setFriendsProfile, images, loading}) => {
    if (loading) {
        return (
            <main className='homepage'>
                <p style={{textAlign: "center", marginTop: "40px"}}>
                    Loading posts...
                </p>
            </main>
        )
    }

    return (
        <main className='homepage'>
            {posts.length ? (
                <Feedposts 
                    images={images}
                    posts={posts}
                    setPosts={setPosts}
                    setFriendsProfile={setFriendsProfile}
                />
            ) : (
                <p style={{textAlign: "center", marginTop: "40px"}}>
                    No posts available
                </p>
            )}
        </main>
    )
}

export default Homepage