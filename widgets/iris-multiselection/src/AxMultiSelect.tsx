import { AxMultiSelectContainerProps } from "../typings/AxMultiSelectProps";
import { AxNewSelectMain } from "./components/AxNewSelectMain";
import "./styles/AxMultiSelect.css";

export function AxMultiSelect(props: AxMultiSelectContainerProps) {
    return <AxNewSelectMain {...props} />;
}
