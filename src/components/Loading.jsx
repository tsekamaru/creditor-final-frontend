const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 animate-spin absolute top-0 left-0"></div>
      </div>
    </div>
  )
}

export default Loading 