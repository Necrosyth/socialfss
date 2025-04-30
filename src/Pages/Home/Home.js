import { useState, useEffect } from 'react'
import Profile from "../../assets/profile.jpg"
import img1 from "../../assets/Post Images/img1.jpg"
import img2 from "../../assets/Post Images/img2.jpg"
import img3 from "../../assets/Post Images/img3.jpg"
import img4 from "../../assets/Post Images/img4.jpg"
import img5 from "../../assets/Post Images/img5.jpg"
import img6 from "../../assets/Post Images/img6.jpg"


import DPimg1 from "../../assets/DP/img1.jpg"
import DPimg2 from "../../assets/DP/img2.jpg"
import DPimg3 from "../../assets/DP/img3.jpg"
import DPimg4 from "../../assets/DP/img4.jpg"
import DPimg5 from "../../assets/DP/img5.jpg"
import DPimg6 from "../../assets/DP/img6.jpg"

import cover from "../../assets/Info-Dp/img-3.jpg"

import Cover1 from "../../assets/Friends-Cover/cover-1.jpg"
import Cover2 from "../../assets/Friends-Cover/cover-2.jpg"
import Cover3 from "../../assets/Friends-Cover/cover-3.jpg"
import Cover5 from "../../assets/Friends-Cover/cover-5.jpg"
import Cover7 from "../../assets/Friends-Cover/cover-7.jpg"
import Cover8 from "../../assets/Friends-Cover/cover-8.jpg"
import Cover9 from "../../assets/Friends-Cover/cover-9.jpg"

import Uimg1 from "../../assets/User-post/img1.jpg"
import Uimg2 from "../../assets/User-post/img2.jpg"
import Uimg3 from "../../assets/User-post/img3.jpg"


import "../Home/Home.css"

import Left from "../../Components/LeftSide/Left"
import Middle from "../../Components/MiddleSide/Middle"
import Right from '../../Components/RightSide/Right'
import Nav from '../../Components/Navigation/Nav'
import moment from 'moment/moment'
import { getPosts, createPost } from '../../services/api'

const Home = ({setFriendsProfile}) => {
    const [posts, setPosts] = useState([])
    const [body, setBody] = useState("")
    const [importFile, setImportFile] = useState("")
    const [search, setSearch] = useState("")
    const [following, setFollowing] = useState("")
    const [showMenu, setShowMenu] = useState(false)
    const [images, setImages] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await getPosts()
                setPosts(fetchedPosts)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching posts:', error)
                setLoading(false)
            }
        }
        fetchPosts()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!body.trim()) return;

        try {
            // Create a loading indicator or message
            setLoading(true);

            // Create post object with the actual File object for the image
            const newPost = {
                description: body.trim(),
                image: images // Pass the File object directly, not a blob URL
            };

            console.log('Creating post with data:', {
                description: body.trim(),
                image: images ? images.name : 'No image'
            }); // Log a simplified version for debugging

            const response = await createPost(newPost);
            console.log('Post creation response:', response);
            
            // Add the new post to the state and reset form
            setPosts([response, ...posts]);
            setBody("");
            setImages(null);
        } catch (error) {
            console.error('Error creating post:', error);
            console.error('Error details:', error.response?.data);
            alert('Error creating post: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className='interface'>
        <Nav 
        search={search}
        setSearch={setSearch}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        />

    <div className="home">
        <Left />

        <Middle 
        handleSubmit={handleSubmit}
                    body={body}
                    setBody={setBody}
                    importFile={importFile}
                    setImportFile={setImportFile}
        posts={posts}
        setPosts={setPosts}
        search={search}
        setFriendsProfile={setFriendsProfile}
        images={images}
        setImages={setImages}
                    loading={loading}
        />

        <Right
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        following={following}
        setFollowing={setFollowing}
        />
    </div>
    </div>
  )
}

export default Home