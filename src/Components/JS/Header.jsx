import React from 'react'
import '../CSS/Header.css'


const Header = (props) => {
var projectName =  prompt("Enter Project Name")||"untitled";
props.global.projectName = projectName;
  return (
    <div id="projectName">{props.global.projectName}</div>
  )
}

export default Header;
