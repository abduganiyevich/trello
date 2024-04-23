import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';

function App() {
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const handleNewBoardChange = (e) => {
    setNewBoardTitle(e.target.value);
  };

  const handleNewBoardSubmit = (e) => {
    e.preventDefault();
    if (newBoardTitle.trim() !== '') {
      setBoards([...boards, { id: `board-${Date.now()}`, title: newBoardTitle, lists: [] }]);
      setNewBoardTitle('');
    }
  };

  const handleNewListSubmit = (boardIndex, newListTitle) => {
    if (newListTitle.trim() !== '') {
      const updatedBoards = [...boards];
      updatedBoards[boardIndex].lists.push({ id: `list-${Date.now()}`, title: newListTitle, cards: [] });
      setBoards(updatedBoards);
    }
  };

  const handleNewCardSubmit = (boardIndex, listIndex, newCardText) => {
    if (newCardText.trim() !== '') {
      const updatedBoards = [...boards];
      updatedBoards[boardIndex].lists[listIndex].cards.push(newCardText);
      setBoards(updatedBoards);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (type === 'board') {
      const newBoards = Array.from(boards);
      const [removed] = newBoards.splice(source.index, 1);
      newBoards.splice(destination.index, 0, removed);
      setBoards(newBoards);
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const boardIndex = boards.findIndex(board => board.id === source.droppableId);
      const listIndex = source.index;
      const copiedCards = Array.from(boards[boardIndex].lists[listIndex].cards);
      const [removed] = copiedCards.splice(source.index, 1);
      copiedCards.splice(destination.index, 0, removed);

      const updatedBoards = boards.map(board =>
        board.id === source.droppableId ? {
          ...board,
          lists: board.lists.map((list, index) => {
            if (index === listIndex) {
              return { ...list, cards: copiedCards };
            }
            return list;
          })
        } : board
      );

      setBoards(updatedBoards);
    }
  };

  return (
    <div className="container">
      <h1>Trello Clone</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="boards-container">
          <Droppable droppableId="all-boards" direction="horizontal" type="board">
            {(provided) => (
              <div className="boards" {...provided.droppableProps} ref={provided.innerRef}>
                {boards.map((board, index) => (
                  <Draggable key={board.id} draggableId={board.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="board"
                      >
                        <h2>{board.title}</h2>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleNewListSubmit(index, e.target.elements.listTitle.value);
                            e.target.elements.listTitle.value = ''; 
                          }}
                        >
                          <input type="text" name="listTitle" placeholder="Enter List Title" />
                          <button type="submit">Add List</button>
                        </form>
                        <Droppable droppableId={board.id} type="list">
                          {(provided) => (
                            <div className="lists-container" {...provided.droppableProps} ref={provided.innerRef}>
                              {board.lists.map((list, listIndex) => (
                                <Draggable key={list.id} draggableId={list.id} index={listIndex}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="list"
                                    >
                                      <h3>{list.title}</h3>
                                      <ul>
                                        {list.cards.map((card, cardIndex) => (
                                          <li key={cardIndex}>{card}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
      <div className="new-board">
        <form onSubmit={handleNewBoardSubmit}>
          <input
            type="text"
            placeholder="Enter Board Title"
            value={newBoardTitle}
            onChange={handleNewBoardChange}
          />
          <button type="submit">Create Board</button>
        </form>
      </div>
    </div>
  );
}

export default App;
