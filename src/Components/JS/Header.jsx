import React from 'react'
import '../CSS/Header.css'


const Header = (props) => {
  return (
    <>
    <div id="projectName">{props.global.userName}</div>
    </>
  )
}

export default Header;
