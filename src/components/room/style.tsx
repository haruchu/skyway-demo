import styled from "styled-components";
export const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  height: 100vh;
`;

export const VideoContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: center;
  gap: 10px;
`;

export const LocalVideo = styled.video`
  width: 20%;
  object-fit: cover;
  border-radius: 12px;
  background-color: black;
`;

export const RemoteVideo = styled.video<{ isLarge?: boolean }>`
  cursor: pointer;
  object-fit: cover;
  border-radius: 12px;
  background-color: black;

  ${({ isLarge }) =>
    isLarge
      ? `
      position: absolute;
      top:0;
      left:0;
      z-index: 10;
      height: 100%;
      width: 100%;
      outline: none;
`
      : `
      z-index: 1;
      width: 20%;
`}
`;
