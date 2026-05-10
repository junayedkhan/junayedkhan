import React from 'react'
import { useForm } from 'react-hook-form'

const Comment = () => {

    const { register, handleSubmit, formState: { errors }, reset } = useForm()
    const onSubmit = (data) => {
        reset()
        console.log("comment: ", JSON.stringify(data) );
    }

    return (
        <>
        <div className="comment">
            <div className="inner">
                <h3 className="title">leave a replay</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-12">
                            {/* == name == */}
                            <div className="form_group">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder="Name"
                                    {...register("name", { required: "Name is required." })}
                                />
                                {errors.name?.message && <p className="errors">{errors.name.message}</p>}
                            </div>
                            {/* == email == */}
                            <div className="form_group">
                                <input
                                    type="text"
                                    name="email"
                                    id="email"
                                    placeholder="Email"
                                    {...register("email",
                                    { required: "Email is required.",
                                    pattern: {value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"} })}
                                />
                                {errors.email?.message && <p className="errors">{errors.email.message}</p>}
                            </div>
                            {/* == phone number == */}
                            <div className="form_group">
                                <input
                                    type="text"
                                    name="phone"
                                    id="phone"
                                    placeholder="Phone(optional)"
                                    {...register("phone",
                                    { required: false,
                                    pattern: {value: /^[0-9\b]+$/,
                                    message: "Invalid phone number"} })}
                                />
                                {errors.phone?.message && <p className="errors">{errors.phone.message}</p>}
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-12">        
                            {/* == comment == */}
                            <div className="form_group">
                                <textarea
                                    placeholder="Comment"
                                    {...register("massage", { required: "Massage is required." })}
                                ></textarea>
                                {errors.massage?.message && <p className="errors">{errors.massage.message}</p>}
                            </div>
                        </div>
                        {/* == button */}
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="form_group_btn">
                                <button type="submit">submit now</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            {/* == from area end == */}
        </div>            
        </>
    )
}

export default Comment;
