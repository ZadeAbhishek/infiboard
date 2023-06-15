import React from 'react'
import varaible from './variable'
import './Header.css'

let global = varaible();
var projectName =  prompt("Enter Project Name")||"untitled";
global.projectName = projectName;
export default function Header() {
   
  return (
    <div id="projectName">{global.projectName}</div>
  )
}
