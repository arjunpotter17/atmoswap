import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Edge, Node } from "react-flow-renderer";
import { getAsset } from "@/app/utils/fetchTokenMetadata";

type RouteSwapInfo = {
  ammKey: string;
  label: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeAmount: string;
  feeMint: string;
};

type RoutePlan = {
  swapInfo: RouteSwapInfo;
  percent: number;
};

interface RouteModalProps {
  routeData: {
    inputMint: string;
    outputMint: string;
    routePlan: RoutePlan[];
  };
  setShowRoutesModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RouteModal = ({
  routeData,
  setShowRoutesModal,
}: RouteModalProps) => {
  const { inputMint, outputMint, routePlan } = routeData;

  // State to hold token names and images
  const [tokenData, setTokenData] = useState<{
    [key: string]: { name: string; image: string };
  }>({});

  // Fetch token names and images for input and output mints
  useEffect(() => {
    const fetchTokenData = async () => {
      const data: { [key: string]: { name: string; image: string } } = {};

      // Fetch input token data
      const inputAsset = await getAsset(inputMint);
      data[inputMint] = {
        name: inputAsset.content.metadata.name || "Unknown Token",
        image: inputAsset.content.links.image || "", // Fallback if no image is found
      };

      // Fetch output token data
      const outputAsset = await getAsset(outputMint);
      data[outputMint] = {
        name: outputAsset.content.metadata.name || "Unknown Token",
        image: outputAsset.content.links.image || "", // Fallback if no image is found
      };

      // Fetch names for each route in the routePlan
      await Promise.all(
        routePlan.map(async (route) => {
          const routeAsset = await getAsset(route.swapInfo.outputMint);
          data[route.swapInfo.outputMint] = {
            name: routeAsset.content.metadata.name || "Unknown Token",
            image: routeAsset.content.links.image || "", // Fallback if no image is found
          };
        })
      );

      setTokenData(data);
    };
    fetchTokenData();
  }, [inputMint, outputMint, routePlan]);

  // Prepare nodes based on routePlan
  const nodes = useMemo(() => {
    const inputNode: Node = {
      id: "input",
      data: {
        label: (
          <div className="flex gap-x-2 items-center rounded-lg">
            <img
              src={tokenData[inputMint]?.image}
              alt={tokenData[inputMint]?.name}
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
            {/* <div>{tokenData[inputMint]?.name || inputMint.slice(0, 4)}</div> */}
            <div className="text-[16px]">
              {routePlan[0]?.swapInfo.inAmount.slice(0, 4)}
            </div>
          </div>
        ),
      },
      position: { x: 100, y: 200 },
      style: {
        background: "#0bd790",
        padding: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "20%",
      },
    };

    const outputNode: Node = {
      id: "output",
      data: {
        label: (
          <div className="flex gap-x-2 items-center rounded-lg">
            <img
              src={tokenData[outputMint]?.image}
              alt={tokenData[outputMint]?.name}
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
            {/* <div>{tokenData[outputMint]?.name || outputMint.slice(0, 4)}</div> */}
            <div className="text-[16px]">
              {routePlan[routePlan.length - 1]?.swapInfo.outAmount.slice(0, 4)}
            </div>
          </div>
        ),
      },
      position: { x: 800, y: 200 },
      style: {
        background: "#0bd790",
        padding: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "20%",
      },
    };

    // Create intermediary nodes for each route
    const intermediateNodes: Node[] = routePlan.map((route, index) => {
      const tokenName =
        tokenData[route.swapInfo.outputMint]?.name ||
        route.swapInfo.outputMint.slice(0, 4);
      return {
        id: `intermediate-${index}`,
        data: { label: `${tokenName}` },
        position: { x: 300 + index * 200, y: 200 },
        style: {
            background: "#0bd790",
            padding: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "20%",
          },
      };
    });

    return [inputNode, ...intermediateNodes, outputNode];
  }, [inputMint, outputMint, routePlan, tokenData]);

  // Prepare edges based on routePlan
  const edges = useMemo(() => {
    return routePlan.map((route, index) => {
      const label = `${route.percent}% via ${route.swapInfo.label}`;

      return {
        id: `edge-${index}`,
        source: index === 0 ? "input" : `intermediate-${index - 1}`,
        target:
          index === routePlan.length - 1 ? "output" : `intermediate-${index}`,
        label,
        animated: true,
        style: { stroke: "#0dbbac" },
        arrowHeadType: "arrowclosed",
      };
    });
  }, [routePlan]);

  // State for nodes and edges
  const [reactFlowNodes, setReactFlowNodes] = React.useState<Node[]>([]);
  const [reactFlowEdges, setReactFlowEdges] = React.useState<Edge[]>([]);

  // Update the state when routeData or token data change
  useEffect(() => {
    setReactFlowNodes(nodes);
    setReactFlowEdges(edges);
  }, [nodes, edges]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-atmos-secondary-teal bg-opacity-10">
      <div className="bg-atmos-bg-black rounded-lg p-10 w-[80%] md:w-[800px]">
        <h2 className="text-lg font-bold mb-4">Order Route Plan</h2>
        <div style={{ height: "300px", width: "100%" }}>
          <ReactFlow
            className="border border-atmos-primary-green rounded-lg flex justify-center items-center mb-4"
            nodes={reactFlowNodes}
            edges={reactFlowEdges}
            fitView
            nodesDraggable={false}
            nodesConnectable={false} // Ensure nodes are not editable
            panOnScroll
          >
            <Background />
          </ReactFlow>
        </div>
        <button
          onClick={() => setShowRoutesModal(false)}
          className="mt-8 bg-atmos-primary-green py-2 px-4 rounded-lg text-atmos-bg-black"
        >
          Close
        </button>
      </div>
    </div>
  );
};
