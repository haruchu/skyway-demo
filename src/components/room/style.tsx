import styled from "styled-components";
import { videoStyle } from "./videoStyle";
export const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  height: 100vh;
  padding: 0 30px;
`;

export const VideoContent = styled.div<{ memberCount: number }>`
  @media screen and (min-width: 900px) {
    width: 50%;
  }
  display: grid;
  flex-wrap: wrap;
  gap: 10px;
  ${({ memberCount }) => `${videoStyle(memberCount)}`}
`;

export const LocalVideo = styled.video<{
  isVideoEnabled: boolean;
}>`
  width: 130px;
  height: 100px;

  @media screen and (min-width: 600px) {
    width: 300px;
    height: 200px;
  }

  object-fit: cover;
  border-radius: 12px;
  background-color: black;
  overflow: hidden;
  position: absolute;
  bottom: 5px;
  right: 5px;
`;

export const RemoteVideo = styled.video<{
  isLarge?: boolean;
}>`
  width: 100%;
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
`}
`;
