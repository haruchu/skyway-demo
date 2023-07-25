import styled from "styled-components";

export const Wrapper = styled.div`
  position: relative;
  height: 100vh;

  video {
    width: 400px;
    height: 300px;
  }
  .share-video {
    width: auto;
    height: auto;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
  }
`;
