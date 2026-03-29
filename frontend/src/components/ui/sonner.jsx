import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        style: {
          background: '#302f2c',
          color: '#ffffff',
          border: '1px solid rgba(63, 72, 22, 0.5)',
        },
      }}
      {...props} />
  );
}

export { Toaster, toast }
