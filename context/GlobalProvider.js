import GlobalContext from './GlobalContext';

export const GlobalProvider = ({ children, value }) => {
    return (
        <GlobalContext.Provider value={value}>
            {children}
        </GlobalContext.Provider>
    );
}