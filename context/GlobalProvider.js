import GlobalContext from './GlobalContext';

export const GlobalProvider = ({ children }) => {
    return (
        <GlobalContext.Provider>
            {children}
        </GlobalContext.Provider>
    );
}