import React, { useState } from "react";
import "../Post/InputPost.css"
import Profile from "../../assets/profile.jpg"
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const InputPost = ({handleSubmit,
                   setBody,
                   body,
                   images,
                   setImages
                  }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
     <div className="i-form">
        <form onSubmit={handleSubmit}>
            <div className="i-input-box">
                <img src={Profile} className='i-img' alt="Profile" />
                
                <textarea 
                id="i-input" 
                placeholder="Say something?"
                required
                value={body}
                onChange={(e)=>setBody(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                />
            </div>

     <div className="file-upload">
      <label htmlFor="file" className="pv-upload">
        <PhotoLibraryIcon className="input-svg" />
        <span className='photo-dis'>Add Photo</span>
      </label>

      <button type='submit'>Share Post</button>
            
      </div>

        <div style={{display:"none"}} >
            <input 
            type="file" 
            id="file"
            accept=".png,jpeg,.jpg"
            onChange={(e)=>setImages(e.target.files[0])}
             />
          </div>

        {images && (
          <div className="displayImg">
            <div className="displayImg-container">
              <img src={URL.createObjectURL(images)} alt="Uploaded preview" />
              <CloseRoundedIcon onClick={()=>setImages(null)} />
            </div>
          </div>
        )}

        </form>
     </div>
  )
}

export default InputPost