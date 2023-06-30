import styled from "styled-components";

export const Wrapper = styled.div<{ isSharing: boolean }>`
  display: ${({ isSharing }) => (isSharing ? "none" : "block")};
  position: relative;
  height: 100vh;
`;
export const ShareVideo = styled.video<{ isSharing: boolean }>`
  display: ${({ isSharing }) => (isSharing ? "block" : "none")};
  height: 100vh;
  width: 100vw;
`;
