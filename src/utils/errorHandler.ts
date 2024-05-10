export const handleError = (err: unknown) => {
    if (err instanceof Error) {
        console.error(err.message);
        return
    } 

    const msgErr = typeof err !== "string" ? JSON.stringify(err) : err
    throw new Error(msgErr);
}