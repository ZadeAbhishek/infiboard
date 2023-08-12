import React, { useEffect } from "react";
import "../CSS/Board.css";
import {mouseDown,mouseUp,mouseWheel,mouseMove,touchStart,touchEnd,touchMove} from "./listeners";
import { redrawCanvas } from "./render";
import varaible from "./variable";

let global = varaible();

export default function Board() {
  useEffect(() => {
      global.canvas = document.getElementById("board");
      global.context = global.canvas.getContext("2d");
      global.rect = global.canvas.getBoundingClientRect();
      global.Path2d = new Path2D();
      //disable right click
      document.oncontextmenu = function() {
          return false;
      };
      
      redrawCanvas();

      window.addEventListener("resize", (e) => {
          redrawCanvas();
      });
      global.canvas.addEventListener("mousedown", mouseDown);
      global.canvas.addEventListener("mouseup", mouseUp, false);
      global.canvas.addEventListener("mousemove", mouseMove, false);
      global.canvas.addEventListener("wheel", mouseWheel, false);
      global.canvas.addEventListener("touchstart", touchStart);
      global.canvas.addEventListener("touchend", touchEnd);
      global.canvas.addEventListener("touchmove", touchMove);
  }, []);
  return ( <> < canvas id = "board" > Board </canvas> </> );
}