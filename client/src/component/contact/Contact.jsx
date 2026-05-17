import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Social from '../Social'
import { ImageWithLoader } from '../ImageWithLoader'
import img from "../../assets/image/contact1.png"

const Contact = () => {

    const [successMessage, setSuccessMessage] = useState("")
    const { register, handleSubmit, formState: { errors }, reset } = useForm()
    const onSubmit = (data) => {
        const mailtoBody = [
            `Name: ${data.name}`,
            `Phone: ${data.phone || "Not provided"}`,
            `Email: ${data.email}`,
            "",
            data.message
        ].join("\n");

        window.location.href = `mailto:junayedkhan@example.com?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(mailtoBody)}`;
        reset()
        setSuccessMessage("Thanks! Your email app is ready with the message.")
    }

    return (
        <section className="contact">
            <div className="title_section">
                <span className="title_bg">contact</span>
                <h1 className="title" >get in <span>touch</span></h1>
            </div>
            {/* == title area end */}
            <div className="main_content">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 col-12 _mb_50">
                            <div className="contact_about_area">
                                <div className="thumbnail">
                                    <ImageWithLoader src={img} alt="contact" />
                                </div>
                                {/* == imgage area end == */}
                                <div className="title_area">
                                    <h4 className="title">Junayed Khan</h4>
                                    <span>Frontend Developer</span>
                                </div>
                                {/* == autor area end == */}
                                <div className="description">
                                    <p>I am available for freelance and frontend work. Share your project details and I will get back to you.</p>
                                    <span className="phone">Phone: <span>Available on request</span></span>
                                    <span className="mail">Email: <a href="mailto:junayedkhan@example.com">junayedkhan@example.com</a></span>
                                </div>
                                {/* == number, email area end == */}
                                <Social />
                                {/* social area end */}
                            </div>
                        </div>
                        {/* == contact about area end */}
                        <div className="col-lg-7 col-12">
                            <div className="contact_form_wrapper">
                                <form className="row" id="contact_form" onSubmit={handleSubmit(onSubmit)}>
                                    {/* == name == */}
                                    <div className="col-lg-6">
                                        <div className="form_group">
                                            <label htmlFor="name">Your Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                {...register("name", { required: "Name is required." })}
                                            />
                                            {errors.name?.message && <p className="errors">{errors.name.message}</p>}
                                        </div>
                                    </div>
                                    {/* == phone == */}
                                    <div className="col-lg-6">
                                        <div className="form_group">
                                            <label htmlFor="phone">Phone Number</label>
                                            <input
                                                name="phone"
                                                id="phone"
                                                type="text"
                                                {...register("phone",
                                                    {
                                                        required: false,
                                                        pattern: {
                                                            value: /^[0-9\b]+$/,
                                                            message: "Invalid phone number"
                                                        }
                                                    })}
                                            />
                                            {errors.phone?.message && <p className="errors">{errors.phone.message}</p>}
                                        </div>
                                    </div>
                                    {/* == email == */}
                                    <div className="col-lg-12">
                                        <div className="form_group">
                                            <label htmlFor="email">Email</label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                {...register("email",
                                                    {
                                                        required: "Email is required.",
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message: "Invalid email address"
                                                        }
                                                    })}
                                            />
                                            {errors.email?.message && <p className="errors">{errors.email.message}</p>}
                                        </div>
                                    </div>
                                    {/* == subject == */}
                                    <div className="col-lg-12">
                                        <div className="form_group">
                                            <label htmlFor="subject">Subject</label>
                                            <input
                                                id="subject"
                                                name="subject"
                                                type="text"
                                                {...register("subject", { required: "Subject is required." })}
                                            />
                                            {errors.subject?.message && <p className="errors">{errors.subject.message}</p>}
                                        </div>
                                    </div>
                                    {/* == message == */}
                                    <div className="col-lg-12">
                                        <div className="form_group">
                                            <label htmlFor="message">Your Message</label>
                                            <textarea
                                                name="message"
                                                id="message"
                                                {...register("message", { required: "Message is required." })}
                                            >
                                            </textarea>
                                            {errors.message?.message && <p className="errors">{errors.message.message}</p>}
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <button name="submit" type="submit" id="submit" className="contact_btn">
                                            <span>SEND MESSAGE</span>
                                            <i className="fas fa-arrow-right" aria-hidden="true"></i>
                                        </button>
                                        {successMessage && <p className="success_message">{successMessage}</p>}
                                        {/* == button area end == */}
                                    </div>
                                </form>
                            </div>
                        </div>
                        {/* == from end == */}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Contact;
