import { useState, useEffect, useCallback } from 'react';

export const useSidebarLayout = () => {
    const [sidebar1Expanded, setSidebar1Expanded] = useState(true);
    const [sidebar2Expanded, setSidebar2Expanded] = useState(true);
    const [sidebar3Expanded, setSidebar3Expanded] = useState(true);
    const [sidebarsWidth, setSidebarsWidth] = useState('');

    const calculateSidebarsWidth = useCallback(() => {
        const width = (sidebar1Expanded ? 1 : 0) +
            (sidebar2Expanded ? 1 : 0) +
            (sidebar3Expanded ? 1 : 0);
        const widthMap = ['max-w-1/12', 'max-w-5/12', 'max-w-7/12', 'max-w-9/12'];
        return widthMap[width];
    }, [sidebar1Expanded, sidebar2Expanded, sidebar3Expanded]);

    useEffect(() => {
        const newWidth = calculateSidebarsWidth();
        setSidebarsWidth(newWidth);
    }, [calculateSidebarsWidth]);

    return {
        sidebar1Expanded,
        setSidebar1Expanded,
        sidebar2Expanded,
        setSidebar2Expanded,
        sidebar3Expanded,
        setSidebar3Expanded,
        sidebarsWidth,
    };
};