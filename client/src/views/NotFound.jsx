import React from 'react'
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <section className="container">
            <div className="tm_error">
                <div className="tm_error_inner">
                    <h1>404!</h1>
                    <h3>Page not found</h3>
                    <p>The page you were looking for could not be found.</p>
                    <Link className="tm_button" to="/">Go to Home</Link>
                </div>
            </div>
            {/* == 404 area end == */}
        </section>
    )
}

export default NotFound;
