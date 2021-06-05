import React from "react";
import { Divider } from "@material-ui/core";
import RyujinxHeader from "../components/RyujinxHeader";

interface IRyujinxContainerProps {
  threshold: number;
}

const RyujinxContainer = ({} : IRyujinxContainerProps) => (
  <div style={{ padding: 20 }}>
    <RyujinxHeader />
    <br />
    <Divider />
  </div>
);

export default RyujinxContainer;
