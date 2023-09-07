import React from 'react'
import '../CSS/Header.css'


const Header = (props) => {
  return (
    <>
    <div id="projectName">{props.total_users}</div>
    </>
  )
}

export default Header;
