import React, { Component } from 'react';
const ContainerStyle=
{
    display:"flex",
    alignItems:"center",
    gap:"10px"
}
const StarContainerStyle=
{
    display:"flex",
    gap:"4px"
}
const textStyle=
{
    lineHeight:"1",
    margin:"0"
}

 const StarRating = ({maxRating=5}) => {
    return (
        <div style={ContainerStyle}>

          <div style={StarContainerStyle} >
             {
                Array.from({length:maxRating},(_,i)=>(<span>s{i}</span>))
             }
           </div>
           <p style={textStyle}>10</p>
        </div> 
    );
}
 
export default StarRating;



