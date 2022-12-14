import Header from "../components/Header"
import LandingPage from "../components/landing-page"
import styles from "../styles/Home.module.css"

export default function Home() {
  return (
    <div className={styles.container}>
      <Header />
      <LandingPage />
    </div>
  )
}
