import React from 'react'
import { useForm } from 'react-hook-form'
import Social from '../Social'
import img from "../../assets/image/contact1.png"

const Contact = () => {

    const { register, handleSubmit, formState: { errors }, reset } = useForm()
    const onSubmit = (data) => {
        reset()
        console.log("massage: ", JSON.stringify(data));
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
                                    <img src={img} alt="contact" />
                                </div>
                                {/* == imgage area end == */}
                                <div className="title_area">
                                    <h4 className="title">Nevine Acotanza</h4>
                                    <span>Chief Operating Officer</span>
                                </div>
                                {/* == autor area end == */}
                                <div className="description">
                                    <p>I am available for freelance work. Connect with me via and call in to my account.</p>
                                    <span className="phone">Phone: <a href="tel:00000000000">+01234567890</a></span>
                                    <span className="mail">Email: <a href="mailto:admin@example.com">admin@example.com</a></span>
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
                                            <label>Your Name</label>
                                            <input
                                                name="phone"
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
                                            <label>Phone Number</label>
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
                                            <label>Email</label>
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
                                            <label>subject</label>
                                            <input
                                                id="subject"
                                                name="subject"
                                                type="text"
                                                {...register("subject", { required: "Subject is required." })}
                                            />
                                            {errors.subject?.message && <p className="errors">{errors.subject.message}</p>}
                                        </div>
                                    </div>
                                    {/* == massage == */}
                                    <div className="col-lg-12">
                                        <div className="form_group">
                                            <label>Your Message</label>
                                            <textarea
                                                name="message"
                                                id="message"
                                                {...register("massage", { required: "Massage is required." })}
                                            >
                                            </textarea>
                                            {errors.massage?.message && <p className="errors">{errors.massage.message}</p>}
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <button name="submit" type="submit" id="submit" className="contact_btn">
                                            <span>SEND MESSAGE</span>
                                            <i className="fas fa-arrow-right"></i>
                                        </button>
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
