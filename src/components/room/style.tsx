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
export const StyledVideo = styled.video<{ isLarge?: boolean }>`
  height: 300px;
  width: 400px;
  cursor: pointer;
  object-fit: cover;
  border-radius: 12px;

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
        position: static;
        z-index: 1;
  `}
`;
