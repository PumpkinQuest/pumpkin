import type { ReactNode } from "react";

export interface AccordionItemProps {
    title: ReactNode;
    children: ReactNode;
    defaultOpen?: boolean;
    groupName?: string;
}
