// src/components/ToolBox.jsx
import React, { useEffect, useState, useRef } from 'react'
import '../CSS/ToolBox.css'
import {
  MoveIcon,
  PencilIcon,
  EraserIcon,
  PaletteIcon,
  UndoIcon,
  RedoIcon,
  HandIcon,
  ContractIcon,
  SquareIcon,
  GearIcon,
  GitHubIcon
} from '../Icons/Icons'

export default function ToolBox({ global, Render, onUndo, onRedo }) {
  // refs for dragging the toolbox
  const toolboxRef = useRef(null)
  const dragging   = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const [pos, setPos] = useState({ x: 20, y: 80 })

  // which button is highlighted?
  const [activeTool, setActiveTool] = useState(null)

  // color‐picker state
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [strokeWidth, setStrokeWidth]         = useState(2)
  const hueRef = useRef(0)

  // ── DRAGGABLE HEADER ───────────────────────
  const startDrag = e => {
    e.preventDefault()
    dragging.current = true
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    dragOffset.current = { x: clientX - pos.x, y: clientY - pos.y }
    window.addEventListener('mousemove', onDrag)
    window.addEventListener('mouseup',   endDrag)
    window.addEventListener('touchmove', onDrag)
    window.addEventListener('touchend',  endDrag)
  }

  const onDrag = e => {
    if (!dragging.current) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    setPos({ x: clientX - dragOffset.current.x, y: clientY - dragOffset.current.y })
  }

  const endDrag = () => {
    dragging.current = false
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup',   endDrag)
    window.removeEventListener('touchmove', onDrag)
    window.removeEventListener('touchend',  endDrag)
  }

  // ── COLOR PICKER WHEEL ────────────────────
  useEffect(() => {
    if (!showColorPicker) return
    const wheel = document.getElementById('color-wheel-inner')
    const sel   = document.getElementById('color-selector')
    const prev  = document.getElementById('color-preview-box')
    if (!wheel || !sel || !prev) return

    // HSL ↔ RGB helpers
    function hslToRgb(h, s, l) {
      let r, g, b
      if (s === 0) {
        r = g = b = l
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1/6) return p + (q - p)*6*t
          if (t < 1/2) return q
          if (t < 2/3) return p + (q - p)*(2/3 - t)*6
          return p
        }
        const q = l < 0.5 ? l*(1+s) : l + s - l*s
        const p = 2*l - q
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
      }
      return [Math.round(r*255), Math.round(g*255), Math.round(b*255)]
    }
    function rgbToHex([r,g,b]) {
      return (
        '#' +
        ((1<<24)|(r<<16)|(g<<8)|b)
          .toString(16)
          .slice(1)
          .toUpperCase()
      )
    }

    function moveInternal(x, y) {
      const { width: W } = wheel.getBoundingClientRect()
      const cx = W/2, cy = W/2
      const dx = x - cx, dy = y - cy
      const ang = Math.atan2(dy, dx)
      const rad = Math.min(Math.hypot(dx, dy), cx)

      sel.style.left = `${cx + rad*Math.cos(ang)}px`
      sel.style.top  = `${cy + rad*Math.sin(ang)}px`
      hueRef.current = (ang*180/Math.PI + 180)%360

      const sat = rad/cx
      const [r,g,b] = hslToRgb(hueRef.current/360, sat, 1)
      const hex = rgbToHex([r,g,b])
      prev.style.backgroundColor = hex
      global.strokeStyle = hex
    }

    const onMouseMove = e => {
      const rect = wheel.getBoundingClientRect()
      moveInternal(e.clientX - rect.left, e.clientY - rect.top)
    }
    const onTouchMove = e => {
      const rect = wheel.getBoundingClientRect()
      const t = e.touches[0]
      moveInternal(t.clientX - rect.left, t.clientY - rect.top)
    }

    const startMouse = e => {
      e.preventDefault()
      onMouseMove(e)
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup',   () => document.removeEventListener('mousemove', onMouseMove), { once:true })
    }
    const startTouch = e => {
      e.preventDefault()
      onTouchMove(e)
      document.addEventListener('touchmove', onTouchMove)
      document.addEventListener('touchend',  () => document.removeEventListener('touchmove', onTouchMove), { once:true })
    }

    wheel.addEventListener('mousedown', startMouse)
    wheel.addEventListener('touchstart', startTouch)
    return () => {
      wheel.removeEventListener('mousedown', startMouse)
      wheel.removeEventListener('touchstart', startTouch)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('touchmove', onTouchMove)
    }
  }, [global, showColorPicker])

  // ── CONTROL HANDLERS ───────────────────────
  const togglePicker       = () => { setShowColorPicker(v => !v); setActiveTool('palette') }
  const updateColor        = e   => { global.strokeStyle = e.target.value }
  const handleStrokeChange = e   => { const v = +e.target.value; setStrokeWidth(v); global.strokeWidth = v }

  const handleDraw   = () => { global.prevState = global.draw; global.draw = 'DRAW';   setActiveTool('draw') }
  const handleErase  = () => { global.prevState = global.draw; global.draw = 'ERASE';  setActiveTool('erase') }
  const handlePan    = () => { global.prevState = global.draw; global.draw = 'PAN';    setActiveTool('pan') }
  const handleSquare = () => { global.prevState = global.draw; global.draw = 'SQUARE'; setActiveTool('square') }
  const handleCentre = () => { global.offsetX=0; global.offsetY=0; global.scale=1; Render.redrawCanvas(); setActiveTool('centre') }

  // ── UNDO / REDO ─────────────────────────────
  const handleUndo = () => {
    onUndo()
    setActiveTool('undo')
  }
  const handleRedo = () => {
    onRedo()
    setActiveTool('redo')
  }

  // ── SETTINGS / GITHUB ───────────────────────
  const handleOpenNav  = () => { document.getElementById('setting-menu-id').style.width = '100%'; setActiveTool('settings') }
  const handleCloseNav = () => { document.getElementById('setting-menu-id').style.width = '0';    setActiveTool(null) }
  const handleGithub   = () => { window.open('https://github.com/ZadeAbhishek/infiboard'); setActiveTool('github') }
  const handleLoad     = () => { setActiveTool('load') }
  const handleSave     = () => { setActiveTool('save') }
  const handleSaveImg  = () => { setActiveTool('image') }

  return (
    <div
      ref={toolboxRef}
      className="toolbox-container"
      style={{ position:'absolute', top:pos.y, left:pos.x, zIndex:1000 }}
    >
      {/* draggable header */}
      <div
        className="toolbox-header"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <MoveIcon/>
      </div>

      {/* main buttons */}
      <div className="toolbox-body">
        <button className={`menubutton ${activeTool==='draw'   ?'active':''}`} onClick={handleDraw}><PencilIcon/></button>
        <button className={`menubutton ${activeTool==='erase'  ?'active':''}`} onClick={handleErase}><EraserIcon/></button>
        <button className={`menubutton ${activeTool==='palette'?'active':''}`} onClick={togglePicker}><PaletteIcon/></button>
        <button className={`menubutton ${activeTool==='undo'   ?'active':''}`} onClick={handleUndo}><UndoIcon/></button>
        <button className={`menubutton ${activeTool==='redo'   ?'active':''}`} onClick={handleRedo}><RedoIcon/></button>
        <button className={`menubutton ${activeTool==='pan'    ?'active':''}`} onClick={handlePan}><HandIcon/></button>
        <button className={`menubutton ${activeTool==='centre' ?'active':''}`} onClick={handleCentre}><ContractIcon/></button>
        <button className={`menubutton ${activeTool==='square' ?'active':''}`} onClick={handleSquare}><SquareIcon/></button>
        <button className={`menubutton ${activeTool==='settings'?'active':''}`} onClick={handleOpenNav}><GearIcon/></button>
      </div>

      <div id="githubPage">
        <button className={`menubutton ${activeTool==='github'?'active':''}`} onClick={handleGithub}><GitHubIcon/></button>
      </div>

      {/* color picker panel */}
      {showColorPicker && (
        <div id="color-picker-panel" className="color-picker">
          <div id="color-preview-box" className="color-preview"/>
          {/* … your basic colors buttons here … */}
          <label htmlFor="strokeRange">Stroke:</label>
          <input
            id="strokeRange"
            type="range"
            min="2" max="15"
            value={strokeWidth}
            onChange={handleStrokeChange}
            className="form-range"
          />
        </div>
      )}

      {/* settings menu */}
      <div id="setting-menu-id" className="setting-menu">
        <a className="closebtn" onClick={handleCloseNav}>&times;</a>
        <a onClick={handleSaveImg}>Save Image</a>
        <a onClick={handleSave}>Save Board</a>
        <a>
          <input type="file" className="file"/>
          <button onClick={handleLoad}>Load Board</button>
        </a>
      </div>
    </div>
  )
}