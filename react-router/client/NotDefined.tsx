function NotDefined<P extends { route: string }>({ route }: P) {

  return (
    <div>
      <strong>React Router Error:</strong>
      <ol>
        <li>Component not found at <strong>...{route}</strong></li>
        <li>Check is default exported</li>
        <li>Check is valid React Component</li>
      </ol>
    </div>
  )
}

export default NotDefined;