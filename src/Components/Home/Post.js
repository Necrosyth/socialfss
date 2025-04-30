import React, { useState } from 'react'
import "../Home/Post.css"
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SentimentSatisfiedRoundedIcon from '@mui/icons-material/SentimentSatisfiedRounded';

import {PiSmileySad} from "react-icons/pi"
import {IoVolumeMuteOutline} from "react-icons/io5"
import {MdBlockFlipped} from "react-icons/md"
import {AiOutlineDelete} from "react-icons/ai"
import {MdReportGmailerrorred} from "react-icons/md"

import {LiaFacebookF} from "react-icons/lia"
import {FiInstagram} from "react-icons/fi"
import {BiLogoLinkedin} from "react-icons/bi"
import {AiFillYoutube} from "react-icons/ai"
import {RxTwitterLogo} from "react-icons/rx"
import {FiGithub} from "react-icons/fi"

import img1 from "../../assets/Following/img-2.jpg"
import img2 from  "../../assets/Following/img-3.jpg"
import img3 from  "../../assets/Following/img-4.jpg"

import Profile from "../../assets/profile.jpg"

import { Link } from 'react-router-dom';
import { likePost, addComment, deletePost } from '../../services/api';
import Comments from '../Comments/Comments';
import AiGeneratedContent from '../Post/AiGeneratedContent';
import ImageDisplay from '../ImageDisplay';

const Post = ({post, posts, setPosts, setFriendsProfile, images}) => {
    const [showDelete, setShowDelete] = useState(false)
    const [showComment, setShowComment] = useState(false)
    const [commentInput, setCommentInput] = useState("")
    const [socialIcons, setSocialIcons] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
    const [showAiContent, setShowAiContent] = useState(false)

    const hasAiContent = post.aiGeneratedTitle || post.aiGeneratedDescription;

    const handleLike = async () => {
        try {
            await likePost(post._id)
            setIsLiked(!isLiked)
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
        } catch (error) {
            console.error('Error liking post:', error)
        }
    }

    const handleDelete = async (postId) => {
        try {
            await deletePost(postId)
            const updatedPosts = posts.filter(p => p._id !== postId)
            setPosts(updatedPosts)
            setShowDelete(false)
        } catch (error) {
            console.error('Error deleting post:', error)
        }
    }

    const handleCommentSubmit = async (e) => {
        e.preventDefault()
        if (!commentInput.trim()) return

        try {
            await addComment(post._id, {
                text: commentInput
            })
            setCommentInput("")
            // Refresh comments or update local state
        } catch (error) {
            console.error('Error adding comment:', error)
        }
    }

    const handleFriendsId = () => {
        setFriendsProfile([post])
    }

    return (
        <div className='post'>
            <div className='post-header'>
                <Link to="/FriendsId" style={{textDecoration: "none"}}>
                    <div className='post-user' onClick={handleFriendsId} style={{cursor: "pointer"}}>
                        <img src={post.userId?.profilePicture || Profile} className='p-img' alt="" />
                        <h2>{post.userId?.username || 'clem'}</h2>
                        <p className='datePara'>{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                </Link>
                
                <div className='delete'>
                    {showDelete && (
                        <div className="options">
                            <button><PiSmileySad />Not Interested in this post</button>
                            <button><IoVolumeMuteOutline />Mute this user</button>
                            <button><MdBlockFlipped />Block this user</button>
                            <button onClick={() => handleDelete(post._id)}><AiOutlineDelete />Delete</button>
                            <button><MdReportGmailerrorred />Report post</button>
                        </div>
                    )}
                    <MoreVertRoundedIcon className='post-vertical-icon' onClick={() => setShowDelete(!showDelete)}/>
                </div>
            </div>

            {/* Display post title if available */}
            {post.title && <h3 className="post-title">{post.title}</h3>}
            
            <p className='body'>{post.description}</p>

            {/* Display the AI content section if available */}
            {hasAiContent && (
                <AiGeneratedContent
                    title={post.aiGeneratedTitle}
                    description={post.aiGeneratedDescription}
                    className="post-ai-content"
                />
            )}

            {post.image && (
                <ImageDisplay 
                    src={post.image} 
                    alt={post.title || "Post image"} 
                    className="post-img"
                    retryCount={2}
                />
            )}

            <div className="post-footer">
                <div className="like-icons">
                    <p className='heart' onClick={handleLike}>
                        {isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderOutlinedIcon />}
                    </p>

                    <MessageRoundedIcon 
                        onClick={() => setShowComment(!showComment)}
                        className='msg'  
                    />

                    <ShareOutlinedIcon 
                        onClick={() => setSocialIcons(!socialIcons)}
                        className='share'  
                    />
                </div>

                <div className="like-comment-details">
                    <span className='post-like'>{likesCount} likes</span>
                    <span className='post-comment'>{post.comments?.length || 0} comments</span>
                </div>

                {showComment && (
                    <div className="commentSection">
                        <form onSubmit={handleCommentSubmit}>
                            <div className="cmtGroup">
                                <SentimentSatisfiedRoundedIcon className='emoji' />
                                <input 
                                    type="text" 
                                    id="commentInput"
                                    required
                                    placeholder='Add a comment...'
                                    onChange={(e) => setCommentInput(e.target.value)}
                                    value={commentInput}
                                />
                                <button type='submit'><SendRoundedIcon className='send' /></button>
                            </div>
                        </form>

                        <div className="sticky">
                            {post.comments?.map((comment) => (
                                <Comments 
                                    key={comment._id}
                                    comment={comment}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Post