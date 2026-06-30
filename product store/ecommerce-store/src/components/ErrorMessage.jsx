function ErrorMessage({
  message = "Something went wrong",
}) {
  return (
    <div className="text-center py-10">
      <p className="text-red-600 font-semibold">
        {message}
      </p>
    </div>
  );
}

export default ErrorMessage;