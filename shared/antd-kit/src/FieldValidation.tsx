import type { ReactElement } from "react";

/** Validation message rendered with Mendix's own classes, so it looks like native inputs. */
export function FieldValidation({ message }: { message?: string }): ReactElement | null {
    if (!message) {
        return null;
    }
    return (
        <div className="alert alert-danger mx-validation-message" role="alert">
            {message}
        </div>
    );
}
