import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { authStore } from "./features/auth/stores/AuthStore";

const App = observer(() => {
  useEffect(() => {
    authStore.initializeSession();
  }, []);

  if (authStore.isCheckingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: 600,
        }}
      >
        Loading...
      </div>
    );
  }

  return <RouterProvider router={router} />;
});

export default App;