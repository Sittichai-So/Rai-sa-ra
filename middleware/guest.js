export default function ({ redirect }) {
  if (!process.client) { return }

  try {
    if (localStorage.getItem('token')) {
      return redirect('/chat/chat')
    }
  } catch (e) {}
}
