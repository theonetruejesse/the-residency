"use client";

import React, { JSX, useEffect } from "react";
import { scan } from "react-scan";

/**
 * ReactScan component to trigger scanning of React components for debugging purposes.
 *
 * @remarks
 * Usage:
 *   <ReactScan />
 */

export const ReactScan = (): JSX.Element => {
  useEffect(() => {
    scan({
      enabled: true,
    });
  }, []);

  return <></>;
};
