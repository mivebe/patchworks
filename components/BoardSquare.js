// import {useContext, useEffect} from "react"

// const BoardSquare = ({
//     checkIfNearHovered,
//     setHovered,
//     canDropPiece,
//     handleDrop,
//     filled,
//     accepting,
//     x,
//     y
//   }) => {
//     const [{ draggedItem, isOver, canDrop }, drop] = useDrop({
//       accept: "piece",
//       drop: item => handleDrop(x, y, item),
//       canDrop: () => canDropPiece(x, y, draggedItem),
//       collect: monitor => ({
//         isOver: !!monitor.isOver(),
//         canDrop: !!monitor.canDrop(),
//         draggedItem: monitor.getItem()
//       })
//     })
  
//     const ctx = useContext(GameContext)
//     useEffect(() => {
//       if (isOver) {
//         ctx.setValidMove(canDrop)
//       }
//     }, [isOver, ctx, canDrop])
  
//     useEffect(() => {
//       if (isOver) {
//         setHovered({ x, y })
//       } else {
//         setHovered(null)
//       }
//     }, [x, y, isOver, setHovered])
  
//     return (
//       <div
//         ref={drop}
//         className={classNames("board-cell", {
//           "board-piece-filled": filled,
//           "valid-move-cell":
//             ctx.validMove && checkIfNearHovered(x, y, draggedItem),
//           "cannot-drop": !ctx.validMove && checkIfNearHovered(x, y, draggedItem)
//         })}
//       />
//     )
//   }