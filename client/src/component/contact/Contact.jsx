import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Social from '../Social'
import { ImageWithLoader } from '../ImageWithLoader'
import img from "../../assets/image/contact1.png"
import Icon from '../Icon'

const Contact = () => {

    const [successMessage, setSuccessMessage] = useState("")
    const { register, handleSubmit, formState: { errors }, reset, clearErrors } = useForm({ mode: "onChange", reValidateMode: "onChange" })
    const handleFormChange = (event) => {
        if (event.target?.name) clearErrors(event.target.name)
        if (successMessage) setSuccessMessage("")
    }
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
        <section className="contact min-h-screen pb-16">
            <div className="title_section relative flex min-h-32 items-center justify-center">
                <span className="title_bg absolute text-6xl font-black uppercase text-ink/5 md:text-8xl">contact</span>
                <h1 className="title relative text-3xl font-black uppercase text-ink md:text-5xl" >get in <span className="text-personal">touch</span></h1>
            </div>
            {/* == title area end */}
            <div className="main_content">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                        <div>
                            <div className="contact_about_area h-full rounded-[1.5rem] bg-vellum/80 p-5 shadow-classic ring-1 ring-white/80 backdrop-blur">
                                <div className="thumbnail overflow-hidden rounded-[1.25rem]">
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
                        <div>
                            <div className="contact_form_wrapper h-full rounded-[1.5rem] bg-vellum/80 p-6 shadow-classic ring-1 ring-white/80 backdrop-blur">
                                <form className="grid gap-5 md:grid-cols-2" id="contact_form" onChange={handleFormChange} onSubmit={handleSubmit(onSubmit)}>
                                    {/* == name == */}
                                    <div>
                                        <div className="form_group">
                                            <label htmlFor="name">Your Name</label>
                                            <input
                                                className="min-h-12 w-full rounded-2xl border border-personal/10 bg-white/80 px-4 outline-none transition focus:border-personal"
                                                type="text"
                                                id="name"
                                                {...register("name", { required: "Name is required." })}
                                            />
                                            {errors.name?.message && <p className="errors">{errors.name.message}</p>}
                                        </div>
                                    </div>
                                    {/* == phone == */}
                                    <div>
                                        <div className="form_group">
                                            <label htmlFor="phone">Phone Number</label>
                                            <input
                                                className="min-h-12 w-full rounded-2xl border border-personal/10 bg-white/80 px-4 outline-none transition focus:border-personal"
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
                                    <div className="md:col-span-2">
                                        <div className="form_group">
                                            <label htmlFor="email">Email</label>
                                            <input
                                                className="min-h-12 w-full rounded-2xl border border-personal/10 bg-white/80 px-4 outline-none transition focus:border-personal"
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
                                    <div className="md:col-span-2">
                                        <div className="form_group">
                                            <label htmlFor="subject">Subject</label>
                                            <input
                                                className="min-h-12 w-full rounded-2xl border border-personal/10 bg-white/80 px-4 outline-none transition focus:border-personal"
                                                id="subject"
                                                name="subject"
                                                type="text"
                                                {...register("subject", { required: "Subject is required." })}
                                            />
                                            {errors.subject?.message && <p className="errors">{errors.subject.message}</p>}
                                        </div>
                                    </div>
                                    {/* == message == */}
                                    <div className="md:col-span-2">
                                        <div className="form_group">
                                            <label htmlFor="message">Your Message</label>
                                            <textarea
                                                className="min-h-36 w-full rounded-2xl border border-personal/10 bg-white/80 px-4 py-3 outline-none transition focus:border-personal"
                                                name="message"
                                                id="message"
                                                {...register("message", { required: "Message is required." })}
                                            >
                                            </textarea>
                                            {errors.message?.message && <p className="errors">{errors.message.message}</p>}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <button name="submit" type="submit" id="submit" className="contact_btn inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-ink px-6 text-sm font-extrabold uppercase tracking-wide text-vellum shadow-button transition hover:-translate-y-1">
                                            <span>SEND MESSAGE</span>
                                            <Icon icon="arrow-right" />
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
