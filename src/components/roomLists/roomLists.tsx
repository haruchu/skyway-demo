"use client";
import { RoomLink, Wrapper } from "./style";

const RoomLists = () => {
  const roomList = [
    "dog",
    "cat",
    "bird",
    "tomato"
  ];

  return (
    <Wrapper>
      {
        roomList.map(item => <RoomLink href={`room?roomId=${item}`}>{item}</RoomLink>)
      }
      
    </Wrapper>
  );
};
export default RoomLists;
